package cli

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
)

// ── styles ────────────────────────────────────────────────────────────────────

var (
	styleLabel    = lipgloss.NewStyle().Foreground(lipgloss.Color("#52525b"))         // zinc-600
	styleValue    = lipgloss.NewStyle().Foreground(lipgloss.Color("#e4e4e7"))         // zinc-200
	styleCyan     = lipgloss.NewStyle().Foreground(lipgloss.Color("#22d3ee"))         // cyan-400
	styleOnline   = lipgloss.NewStyle().Foreground(lipgloss.Color("#4ade80")).Bold(true) // green-400
	styleTitle    = lipgloss.NewStyle().Foreground(lipgloss.Color("#ffffff")).Bold(true)
	styleDim      = lipgloss.NewStyle().Foreground(lipgloss.Color("#3f3f46"))         // zinc-700
	styleSep      = lipgloss.NewStyle().Foreground(lipgloss.Color("#27272a"))         // zinc-800

	styleMethod = map[string]lipgloss.Style{
		"GET":     lipgloss.NewStyle().Foreground(lipgloss.Color("#60a5fa")), // blue-400
		"POST":    lipgloss.NewStyle().Foreground(lipgloss.Color("#4ade80")), // green-400
		"PUT":     lipgloss.NewStyle().Foreground(lipgloss.Color("#fb923c")), // orange-400
		"PATCH":   lipgloss.NewStyle().Foreground(lipgloss.Color("#fb923c")),
		"DELETE":  lipgloss.NewStyle().Foreground(lipgloss.Color("#f87171")), // red-400
		"HEAD":    lipgloss.NewStyle().Foreground(lipgloss.Color("#a1a1aa")), // zinc-400
		"OPTIONS": lipgloss.NewStyle().Foreground(lipgloss.Color("#a1a1aa")),
	}
)

func methodStyle(m string) lipgloss.Style {
	if s, ok := styleMethod[m]; ok {
		return s
	}
	return styleValue
}

func statusStyle(code int) lipgloss.Style {
	switch {
	case code >= 500:
		return lipgloss.NewStyle().Foreground(lipgloss.Color("#f87171")).Bold(true) // red
	case code >= 400:
		return lipgloss.NewStyle().Foreground(lipgloss.Color("#fbbf24"))            // amber
	case code >= 300:
		return lipgloss.NewStyle().Foreground(lipgloss.Color("#a78bfa"))            // violet
	case code >= 200:
		return lipgloss.NewStyle().Foreground(lipgloss.Color("#4ade80"))            // green
	default:
		return styleDim
	}
}

// ── formatting helpers ────────────────────────────────────────────────────────

const uiWidth = 68 // printable width (no ANSI), used for padding

func fmtBytes(n int64) string {
	switch {
	case n >= 1<<30:
		return fmt.Sprintf("%.2f GB", float64(n)/(1<<30))
	case n >= 1<<20:
		return fmt.Sprintf("%.1f MB", float64(n)/(1<<20))
	case n >= 1<<10:
		return fmt.Sprintf("%.1f KB", float64(n)/(1<<10))
	default:
		return fmt.Sprintf("%d B", n)
	}
}

func fmtDuration(d time.Duration) string {
	switch {
	case d >= time.Second:
		return fmt.Sprintf("%.1fs", d.Seconds())
	case d >= time.Millisecond:
		return fmt.Sprintf("%dms", d.Milliseconds())
	default:
		return fmt.Sprintf("%dµs", d.Microseconds())
	}
}

func fmtUptime(d time.Duration) string {
	h := int(d.Hours())
	m := int(d.Minutes()) % 60
	s := int(d.Seconds()) % 60
	if h > 0 {
		return fmt.Sprintf("%d:%02d:%02d", h, m, s)
	}
	return fmt.Sprintf("%d:%02d", m, s)
}

func pad(s string, width int) string {
	// Visual width (strip ANSI codes for counting) — simple approximation:
	// we measure the RENDERED rune count by checking lipgloss width.
	w := lipgloss.Width(s)
	if w >= width {
		return s
	}
	return s + strings.Repeat(" ", width-w)
}

func sep() string {
	return styleSep.Render(strings.Repeat("─", uiWidth))
}

// ── UIOptions ─────────────────────────────────────────────────────────────────

// UIOptions holds the static config displayed in the header.
type UIOptions struct {
	Subdomain  string
	URL        string
	Port       int
	ServerAddr string
}

// ── rendering ────────────────────────────────────────────────────────────────

// uiLineCount is the number of \n-terminated lines renderUI emits.
// RunLiveUI uses this to move the cursor back exactly this many lines.
const uiLineCount = 21

// renderUI returns a string of exactly uiLineCount newline-terminated lines.
func renderUI(s *TunnelStats, opts UIOptions) string {
	var b strings.Builder

	write := func(line string) {
		b.WriteString(line)
		b.WriteByte('\n')
	}

	// ── Line 1: blank ─────────────────────────────────────────────────────────
	write("")

	// ── Line 2: title bar ─────────────────────────────────────────────────────
	title := styleTitle.Render("  BINBOI")
	version := styleDim.Render("v" + Version)
	uptime := styleLabel.Render("up ") + styleValue.Render(fmtUptime(s.Uptime()))
	right := version + "  " + uptime
	gap := uiWidth - lipgloss.Width(title) - lipgloss.Width(right)
	if gap < 1 {
		gap = 1
	}
	write(title + strings.Repeat(" ", gap) + right)

	// ── Line 3: separator ─────────────────────────────────────────────────────
	write(sep())

	// ── Line 4: blank ─────────────────────────────────────────────────────────
	write("")

	// ── Line 5: status + URL ──────────────────────────────────────────────────
	statusDot := styleOnline.Render("● ONLINE")
	urlStr := styleCyan.Render(opts.URL)
	arrow := styleDim.Render("  →  ")
	local := styleLabel.Render(fmt.Sprintf("localhost:%d", opts.Port))
	write("  " + statusDot + "   " + urlStr + arrow + local)

	// ── Line 6: relay + ping ──────────────────────────────────────────────────
	relayLabel := styleLabel.Render("  Relay  ")
	relayVal := styleValue.Render(opts.ServerAddr)
	pingLabel := styleLabel.Render("  Ping  ")
	var pingVal string
	if p := s.Ping(); p > 0 {
		pingVal = styleValue.Render(fmtDuration(p))
	} else {
		pingVal = styleDim.Render("measuring…")
	}
	write(relayLabel + relayVal + pingLabel + pingVal)

	// ── Line 7: blank ─────────────────────────────────────────────────────────
	write("")

	// ── Line 8: separator ─────────────────────────────────────────────────────
	write(sep())

	// ── Line 9: aggregate stats ───────────────────────────────────────────────
	reqs := s.Requests.Load()
	errs := s.Errors.Load()
	bytesIn := s.BytesIn.Load()
	bytesOut := s.BytesOut.Load()
	avg := s.AvgDuration()

	col := func(label, value string) string {
		return styleLabel.Render(label) + "  " + styleValue.Render(value)
	}

	var errColor lipgloss.Style
	if errs > 0 {
		errColor = lipgloss.NewStyle().Foreground(lipgloss.Color("#f87171"))
	} else {
		errColor = styleDim
	}

	statsLine := fmt.Sprintf("  %s   %s   %s   %s   %s",
		col("Requests", fmt.Sprintf("%d", reqs)),
		styleLabel.Render("Errors")+"  "+errColor.Render(fmt.Sprintf("%d", errs)),
		col("↓", fmtBytes(bytesIn)),
		col("↑", fmtBytes(bytesOut)),
		col("Avg", func() string {
			if avg == 0 {
				return styleDim.Render("—")
			}
			return fmtDuration(avg)
		}()),
	)
	write(statsLine)

	// ── Line 10: separator ────────────────────────────────────────────────────
	write(sep())

	// ── Line 11: blank ────────────────────────────────────────────────────────
	write("")

	// ── Line 12: section header ───────────────────────────────────────────────
	write("  " + styleDim.Render("RECENT REQUESTS"))

	// ── Line 13: column headers ───────────────────────────────────────────────
	hdr := fmt.Sprintf("  %-8s %-36s %-7s %-8s %s",
		styleLabel.Render("METHOD"),
		styleLabel.Render("PATH"),
		styleLabel.Render("STATUS"),
		styleLabel.Render("RTT"),
		styleLabel.Render("TIME"),
	)
	write(hdr)

	// ── Line 14: header separator ─────────────────────────────────────────────
	write(sep())

	// ── Lines 15-19: up to 5 most recent requests (padded if fewer) ───────────
	recent := s.Recent()
	// Show at most 5, newest first.
	if len(recent) > 5 {
		recent = recent[len(recent)-5:]
	}
	// Reverse so newest is at top.
	for i, j := 0, len(recent)-1; i < j; i, j = i+1, j-1 {
		recent[i], recent[j] = recent[j], recent[i]
	}

	for i := 0; i < 5; i++ {
		if i < len(recent) {
			r := recent[i]
			mStyle := methodStyle(r.Method)
			sStyle := statusStyle(r.Status)

			statusStr := "—"
			if r.Status > 0 {
				statusStr = fmt.Sprintf("%d", r.Status)
			}
			pathStr := r.Path
			if len(pathStr) > 34 {
				pathStr = pathStr[:31] + "..."
			}

			line := fmt.Sprintf("  %s %s %s %s %s",
				pad(mStyle.Render(r.Method), 9),
				pad(styleValue.Render(pathStr), 37),
				pad(sStyle.Render(statusStr), 8),
				pad(styleDim.Render(fmtDuration(r.Duration)), 9),
				styleDim.Render(r.At.Format("15:04:05")),
			)
			write(line)
		} else {
			write(styleDim.Render("  —"))
		}
	}

	// ── Line 20: footer separator ─────────────────────────────────────────────
	write(sep())

	// ── Line 21: blank ────────────────────────────────────────────────────────
	write("")

	return b.String()
}

// ── RunLiveUI ────────────────────────────────────────────────────────────────

// RunLiveUI prints the tunnel dashboard and refreshes it in-place every second.
// It stops when stopCh is closed. Call from a dedicated goroutine.
func RunLiveUI(stats *TunnelStats, opts UIOptions, stopCh <-chan struct{}) {
	// Initial render.
	ui := renderUI(stats, opts)
	fmt.Print(ui)

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-stopCh:
			return
		case <-ticker.C:
			// Move cursor up uiLineCount lines and clear to end of screen,
			// then redraw the entire UI block in place.
			fmt.Printf("\033[%dA\033[J", uiLineCount)
			fmt.Print(renderUI(stats, opts))
		}
	}
}

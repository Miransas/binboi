package client

import (
	"fmt"
	"github.com/charmbracelet/lipgloss"
	"strings"
)

var (
	// Miransas Cyberpunk Renk Paleti
	colorCyan    = lipgloss.Color("#00FFD1")
	colorMagenta = lipgloss.Color("#FF00FF")
	colorGreen   = lipgloss.Color("#39FF14")
	colorGray    = lipgloss.Color("#71717A")
	colorDark    = lipgloss.Color("#27272A")

	// Stiller
	styleTitle  = lipgloss.NewStyle().Foreground(colorCyan).Bold(true).Italic(true).MarginBottom(1)
	styleLabel  = lipgloss.NewStyle().Foreground(colorGray).Width(12)
	styleValue  = lipgloss.NewStyle().Foreground(lipgloss.Color("#E4E4E7")).Bold(true)
	styleURL    = lipgloss.NewStyle().Foreground(colorMagenta).Underline(true)
	styleStatus = lipgloss.NewStyle().Background(colorCyan).Foreground(lipgloss.Color("#000000")).Padding(0, 1).Bold(true)
	
	// Çerçeve (Kutu) Stili
	styleBox = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder(), true).
			BorderForeground(colorDark).
			Padding(1, 4).
			MarginBottom(1)
)

// ShowWelcome: Terminali temizler ve bağlantı bilgilerini çizer
func ShowWelcome(url string, port int, account string, region string) {
	// Terminali temizle (Mac/Linux için)
	fmt.Print("\033[H\033[2J")

	var sb strings.Builder

	// Başlık
	sb.WriteString(styleTitle.Render("B I N B O I   N E U R A L   L I N K") + "\n\n")

	// Bilgiler
	sb.WriteString(fmt.Sprintf("%s %s\n", styleLabel.Render("Session"), styleValue.Render("Status: "+styleStatus.Render("ONLINE"))))
	sb.WriteString(fmt.Sprintf("%s %s\n", styleLabel.Render("Account"), styleValue.Render(account)))
	sb.WriteString(fmt.Sprintf("%s %s\n", styleLabel.Render("Version"), styleValue.Render("v0.2.0-alpha")))
	sb.WriteString(fmt.Sprintf("%s %s\n", styleLabel.Render("Region"), styleValue.Render(region)))
	sb.WriteString(fmt.Sprintf("%s %s\n", styleLabel.Render("Web Interface"), styleValue.Render("http://localhost:4040")))
	
	sb.WriteString("\n")
	
	// Yönlendirme (Routing)
	sb.WriteString(fmt.Sprintf("%s %s -> localhost:%d\n", styleLabel.Render("Forwarding"), styleURL.Render(url), port))

	// Kutuyu Render Et ve Ekrana Bas
	fmt.Println(styleBox.Render(sb.String()))
	
	// Alt Bilgi
	fmt.Println(lipgloss.NewStyle().Foreground(colorGray).Render("Ctrl+C to quit"))
	fmt.Println()
	fmt.Println(lipgloss.NewStyle().Foreground(colorCyan).Bold(true).Render("HTTP Requests"))
	fmt.Println(lipgloss.NewStyle().Foreground(colorDark).Render("-------------"))
}

// LogRequest: Gelen trafiği terminale canlı ve renkli olarak yazar
func LogRequest(method string, path string, statusCode int, duration string) {
	// Metoda göre renk seçimi
	methodStyle := lipgloss.NewStyle().Bold(true).Width(6)
	switch method {
	case "GET":
		methodStyle = methodStyle.Foreground(colorGreen)
	case "POST":
		methodStyle = methodStyle.Foreground(colorCyan)
	case "DELETE", "PUT":
		methodStyle = methodStyle.Foreground(colorMagenta)
	}

	// Durum koduna göre renk
	statusStyle := lipgloss.NewStyle().Bold(true)
	if statusCode >= 200 && statusCode < 300 {
		statusStyle = statusStyle.Foreground(colorGreen)
	} else if statusCode >= 400 {
		statusStyle = statusStyle.Foreground(lipgloss.Color("#FF003C")) // Kırmızı
	}

	// Çıktı formatı: GET    /api/users    200 OK    12ms
	fmt.Printf("%s %-25s %s %s\n",
		methodStyle.Render(method),
		path,
		statusStyle.Render(fmt.Sprintf("%d", statusCode)),
		lipgloss.NewStyle().Foreground(colorGray).Render(duration),
	)
}
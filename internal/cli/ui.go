package cli

import (
	"fmt"
	"github.com/charmbracelet/lipgloss"
)

var (
	cyan    = lipgloss.Color("#00FFD1")
	magenta = lipgloss.Color("#FF00FF")
	white   = lipgloss.Color("#FFFFFF")
	gray    = lipgloss.Color("#3C3C3C")

	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(white).
			Background(magenta).
			Padding(0, 2).
			MarginBottom(1)

	boxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(cyan).
			Padding(1, 3).
			Width(50)

	infoStyle = lipgloss.NewStyle().Foreground(cyan)
	urlStyle  = lipgloss.NewStyle().Foreground(white).Underline(true)
)

func RenderCoolUI(subdomain, url string, port int) {
	title := titleStyle.Render(" BINBOI AGENT ")
	
	content := fmt.Sprintf(
		"Status:   %s\nTunnel:   %s\nSubdomain:%s\nLocal:    %s\n\n%s",
		infoStyle.Render("● ONLINE"),
		urlStyle.Render(url),
		infoStyle.Render(subdomain),
		fmt.Sprintf("localhost:%d", port),
		lipgloss.NewStyle().Italic(true).Foreground(gray).Render("Waiting for traffic..."),
	)

	fmt.Println(title)
	fmt.Println(boxStyle.Render(content))
}

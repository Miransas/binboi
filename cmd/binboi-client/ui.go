package main

import (
	"fmt"
	"github.com/charmbracelet/lipgloss"
)

var (
	// Miransas Color Palette
	cyan    = lipgloss.Color("#00FFD1")
	gray    = lipgloss.Color("#3C3C3C")
	white   = lipgloss.Color("#FFFFFF")
	magenta = lipgloss.Color("#FF00FF")

	// Component Styles
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

func renderCoolUI(subdomain, url string, port int) {
	title := titleStyle.Render(" MIRANSAS BINBOI v0.2.0 ")
	
	content := fmt.Sprintf(
		"Status:   %s\nTunnel:   %s\nLocal:    %s\n\n%s",
		infoStyle.Render("● ONLINE"),
		urlStyle.Render(url),
		fmt.Sprintf("localhost:%d", port),
		lipgloss.NewStyle().Italic(true).Foreground(gray).Render("Waiting for traffic..."),
	)

	fmt.Println(title)
	fmt.Println(boxStyle.Render(content))
}
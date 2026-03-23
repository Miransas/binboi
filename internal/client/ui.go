package client


import (
	"fmt"
	"github.com/charmbracelet/lipgloss"
)

var (
	styleTitle = lipgloss.NewStyle().Foreground(lipgloss.Color("#00FFD1")).Bold(true).MarginLeft(2)
	styleURL   = lipgloss.NewStyle().Foreground(lipgloss.Color("#5F5FFF")).Underline(true)
	styleStatus = lipgloss.NewStyle().Background(lipgloss.Color("#005F00")).Padding(0, 1)
)

func ShowWelcome(url string, port int) {
	fmt.Println("\n" + styleTitle.Render("MIRANSAS BINBOI v0.1.0"))
	fmt.Println(lipgloss.NewStyle().Border(lipgloss.NormalBorder()).Padding(1, 2).Render(
		fmt.Sprintf("Status:   %s\nForward:  %s  ->  localhost:%d", 
			styleStatus.Render("ONLINE"), 
			styleURL.Render(url), 
			port),
	))
}
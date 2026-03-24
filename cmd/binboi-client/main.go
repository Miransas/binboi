package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/miransas/binboi/internal/cli"
	"github.com/miransas/binboi/internal/config"
)

func main() {
	port := flag.Int("port", 3000, "Local port")
	sub := flag.String("sub", "sazlab", "Subdomain")
	flag.Parse()

	token, err := config.LoadToken()
	if err != nil {
		fmt.Println("🔴 Auth required: binboi auth <token>")
		os.Exit(1)
	}

	cli.StartHttpTunnel(token, *port, *sub)
}


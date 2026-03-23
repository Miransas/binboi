package main

import (
	"flag"
	"fmt"
	"os"
	
	"github.com/miransas/binboi/internal/db"
	"github.com/miransas/binboi/internal/models"
	
)

// ... (Önceki importlar aynı kalacak)

func main() {
	db.InitDB()

	// Subcommands
	registerCmd := flag.NewFlagSet("register", flag.ExitOnError)
	userReg := registerCmd.String("user", "", "Username to register")

	deleteCmd := flag.NewFlagSet("delete", flag.ExitOnError)
	userDel := deleteCmd.String("user", "", "Username to delete")

	if len(os.Args) < 2 {
		fmt.Println("Usage: binboi-server [run|register|list|delete]")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "list":
		var users []models.User
		db.DB.Preload("Tunnels").Find(&users)
		fmt.Println("📋 MIRANSAS BINBOI USER LIST")
		fmt.Println("--------------------------------------------------")
		for _, u := range users {
			subdomains := ""
			for _, t := range u.Tunnels {
				subdomains += t.Subdomain + " "
			}
			fmt.Printf("👤 %-15s | Domains: %s\n", u.Username, subdomains)
		}

	case "delete":
		deleteCmd.Parse(os.Args[2:])
		if *userDel == "" {
			fmt.Println("❌ Error: Provide a username with -user")
			return
		}
		// Cascade delete (Tunnels of the user will also be removed if configured)
		db.DB.Where("username = ?", *userDel).Delete(&models.User{})
		fmt.Printf("🗑️ User %s and their records deleted.\n", *userDel)

	case "register":
		registerCmd.Parse(os.Args[2:])
		if *userReg == "" {
			fmt.Println("❌ Error: Provide a username with -user")
			return
		}
		db.DB.Create(&models.User{Username: *userReg})
		fmt.Printf("✅ User %s registered successfully.\n", *userReg)
	
	case "run":
		// ... (Sunucu başlatma kodun)
	}
}
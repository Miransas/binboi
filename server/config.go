
package main

import "os"

func getAPIToken() string {
	t := os.Getenv("ELASIYA_TOKEN")
	if t == "" {
		t = "dev-secret-token"
	}
	return t
}

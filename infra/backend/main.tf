# Terraform configuration for Google Cloud VM

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

# VM Instance
resource "google_compute_instance" "app_server" {
  name         = "flowspace-backend"
  machine_type = "e2-micro" # Free tier eligible in some regions
  zone         = "${var.region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
    access_config {
      # This provides an ephemeral public IP
    }
  }

  # Metadata to install Docker on startup
  metadata_startup_script = <<-EOT
    #!/bin/bash
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
  EOT

  tags = ["http-server", "https-server", "backend-api"]
}

# Firewall rule for Backend API
resource "google_compute_firewall" "backend_api" {
  name    = "allow-backend-api"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["backend-api"]
}

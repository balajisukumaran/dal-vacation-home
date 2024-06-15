provider "google" {
  credentials = file(var.credentials_file)
  project     = var.project_id
  region      = var.region
}

variable "credentials_file" {
  default = "C:\\Users\\balaj\\Downloads\\AWS\\dal-vacation-home-fa37fc0ac484.json"
}

variable "project_id" {
  default = "dal-vacation-home"
}

variable "region" {
  default = "us-east1"
}

resource "google_service_account" "default" {
  account_id   = "cloud-run-sa"
  display_name = "Cloud Run Service Account"
}

resource "google_project_iam_binding" "sa-roles" {
  project = var.project_id
  role    = "roles/run.admin"

  members = [
    "serviceAccount:${google_service_account.default.email}"
  ]
}

resource "google_cloud_run_service" "default" {
  name     = "dal-vacation-home-service"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.default.email

      containers {
        image = "us-east1-docker.pkg.dev/${var.project_id}/vacation-home/vacation-home:8ec02349f7a046262c1b6399026fcb786d82b851"
        ports {
          container_port = 80
        }
      }

      container_concurrency = 80
      timeout_seconds       = 300
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_binding" "invoker" {
  location    = google_cloud_run_service.default.location
  project     = google_cloud_run_service.default.project
  service     = google_cloud_run_service.default.name
  role        = "roles/run.invoker"
  members     = ["allUsers"]
}

output "cloud_run_url" {
  value = google_cloud_run_service.default.status[0].url
}

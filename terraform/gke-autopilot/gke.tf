module "kubernetes-engine_example_simple_autopilot_public" {
  source  = "terraform-google-modules/kubernetes-engine/google//examples/simple_autopilot_public"
  version = "27.0.0"
  project_id = "mythica-389914"
  region = "us-central1"
}

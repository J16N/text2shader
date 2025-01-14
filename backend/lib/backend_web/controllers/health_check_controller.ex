defmodule BackendWeb.HealthCheckController do
  use Phoenix.Controller, formats: [:json]
  require Logger

  def index(conn, _params) do
    Logger.info("Health check")
    json(conn, %{status: "ok"})
  end
end

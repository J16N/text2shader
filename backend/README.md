# Text2Shader Backend

This is the backend of Text2Shader, a web application that generates shaders from text descriptions. The backend is written in Elixir using the Phoenix framework. Google Gemini is used for generating shader code from text description.

## Deployment

1. Install Elixir and Phoenix. Follow the instructions [here](https://hexdocs.pm/phoenix/installation.html).

2. Set these environment variables:
    - `GEMINI_API_KEY`: API key for Google Gemini.
    - `SECRET_KEY_BASE`: Secret key for Phoenix.
    - `MIX_ENV`: Environment for the application (e.g. `dev` or `prod`).

3. Install dependencies with:
    ```bash
    mix deps.get --only prod && mix compile
    ```
4. Start the server:
    ```bash
    mix phx.server
    ```

## Endpoints
Available endpoints are as follows:

- `GET /api/shader?text=...`: Generate shader code from text description.
- `GET /api/health-check`: Check the health of the server.
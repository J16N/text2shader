defmodule BackendWeb.ShaderControllerClaude do
  use Phoenix.Controller, formats: [:json]
  require Logger

  @envar Application.compile_env(:backend, BackendWeb.Endpoint)
  @api_key System.get_env("CLAUDE_API_KEY")
  @headers [
    {"User-Agent", "Elixir"},
    {"Content-Type", "application/json"},
    {"anthropic-version", "2023-06-01"},
    {"x-api-key", @api_key}
  ]
  @options [recv_timeout: 60_000]

  def index(conn, %{"text" => text}) do
    resp =
      @envar[:claude_url]
      |> handle_request(post_body(text))
      |> handle_response
      |> decode_response

    json(conn, resp)
  end

  defp check_for_error(200), do: :ok
  defp check_for_error(_), do: :error

  defp decode_response({:ok, {:ok, body}}) do
    %{
      status: "Success",
      message: (body["content"] |> hd)["text"]
    }
  end

  defp decode_response({:ok, {:error, _body}}) do
    %{status: "Error", message: "Failed to generate shader code"}
  end

  defp decode_response({:error, reason}) do
    %{status: "Error", message: reason}
  end

  defp handle_request(url, {:ok, body}) do
    url |> HTTPoison.post(body, @headers, @options)
  end

  defp handle_request(_url, {:error, _}), do: {:error}

  defp handle_response({:ok, %{status_code: status_code, body: body}}) do
    Logger.info("Got response: status code = #{status_code}")
    Logger.debug(fn -> inspect(body) end)

    {
      status_code |> check_for_error,
      body |> Jason.decode()
    }
  end

  defp handle_response({:error, %HTTPoison.Error{reason: reason}}) do
    Logger.error("Failed to send request: reason = #{reason}")

    {:error, reason}
  end

  defp post_body(text) do
    %{
      model: @envar[:claude_model],
      max_tokens: 4096,
      system:
        "You are an expert coder. You will only output two codeblocks. The first codeblock will have accurate WebGL shader codes. The second codeblock will have the source code of complete HTML/WebGL application that uses those shader codes to render the result. The width and height property of canvas tag should be set to \"800\" and \"600\" respectively. Include the following callback function in `error` event of `window` using `addEventListener`:\n```javascript\nfunction (event) {\nconst {message, fileName, lineNumber} = event;\nwindow.top.postMessage(new Error(message, fileName, lineNumber), \"*\");\n}\n```\nInclude the following styles:\n```css\n*, *::before, *::after {\n\t\tmargin: 0;\n\t\tpadding: 0;\n\t\tbox-sizing: border-box;\n}\n\nbody {\n\t\tdisplay: flex;\n\t\tjustify-content: center;\n\t\talign-items: center;\n\t\theight: 100vh;\n\t\twidth: 100vw;\n}\n\ncanvas {\n\t\twidth: 100%;\n\t\theight: 100%;\n\t\tbackground: hsl(0, 3%, 13%);\n}\n```\nDo not use any non-printable character that can hurdle JSON parsing. Do not reveal about yourself. Do not output anything else.",
      messages: [
        %{
          role: "user",
          content: text
        }
      ]
    }
    |> Jason.encode([{:escape, :html_safe}, {:maps, :strict}])
  end
end

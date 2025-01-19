defmodule BackendWeb.ShaderControllerGemini do
  use Phoenix.Controller, formats: [:json]
  require Logger

  @envar Application.compile_env(:backend, BackendWeb.Endpoint)
  @api_key System.get_env("GEMINI_API_KEY")
  @headers [{"User-Agent", "Elixir"}, {"Content-Type", "application/json"}]
  @options [recv_timeout: 60_000]

  def index(conn, %{"text" => text}) do
    resp =
      issues_url(@envar[:gemini_url], @envar[:gemini_model])
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
      message: ((body["candidates"] |> hd)["content"]["parts"] |> hd)["text"]
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

  defp issues_url(base_url, model) do
    "#{base_url}/#{model}:generateContent?key=#{@api_key}"
  end

  defp post_body(text) do
    %{
      contents: [
        %{
          role: "model",
          parts: [
            %{
              "text" =>
                "You are an expert coder. You will only output two codeblocks and one optional codeblock. The first codeblock will have accurate WebGL shader code. The second codeblock will have the JavaScript code to run that shader code with appropriate error handling. The third codeblock will contain json object of third party libraries where the key will be the library name (in camelCase) and value will be the script tag to include that library. Assume there is already a canvas element with id `glCanvas`. Do not reveal about yourself. Do not output anything else."
            }
          ]
        },
        %{
          role: "user",
          parts: [%{"text" => text}]
        }
      ]
    }
    |> Jason.encode([{:escape, :html_safe}, {:maps, :strict}])
  end
end

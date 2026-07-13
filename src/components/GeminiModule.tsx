
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { apiFetch } from "../utils/apiHelper";

export function GeminiModule() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setResponse("");
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/gemini-api-handler`;
      const result = await apiFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!result.ok) {
        throw new Error("Failed to fetch response from Gemini API");
      }

      const data = await result.json();
      setResponse(data.text);
    } catch (error) {
      console.error(error);
      setResponse("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gemini Pro Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Loading..." : "Ask Gemini"}
        </Button>
        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{response}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

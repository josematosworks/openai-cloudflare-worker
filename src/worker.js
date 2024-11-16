export default {
    async fetch(request, env) {
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        try {
            const { urls } = await request.json();
            
            if (!urls || !Array.isArray(urls) || urls.length === 0) {
                return new Response('Array of URLs is required', { status: 400 });
            }

            // Convert URLs to content array, detecting file type
            const content = [
              { type: "text", text: "Please summarize these files:" },
              ...urls.map((url) => ({
                type: "image_url",
                image_url: {
                  url: url
                }
              })),
            ];

            const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'user',
                            content
                        }
                    ],
                    max_tokens: 1000
                })
            });

            const result = await openAIResponse.json();
            
            return new Response(JSON.stringify({
                result: result
            }), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
};
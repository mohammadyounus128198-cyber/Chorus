export const runtime = 'edge';

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Immediate ': ok' to verify connection and flush buffers
      controller.enqueue(encoder.encode(": ok\n\n"));
      
      // Simulate allocator solving steps
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const message = `data: ${JSON.stringify({ step, status: "solving", timestamp: Date.now() })}\n\n`;
        controller.enqueue(encoder.encode(message));
        
        if (step >= 5) {
          clearInterval(interval);
          controller.close();
        }
      }, 500);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      // Optional extra guard for some specialized CDNs
      'X-Accel-Buffering': 'no',
      // Prevents compression layer from buffering on Vercel
      'Content-Encoding': 'none'
    },
  });
}

import java.io.*;
import java.net.*;
import java.util.*;

public class BareServer {
  public static void main(String[] args) throws Exception {
    ServerSocket server = new ServerSocket(8080);
    System.out.println("Server running on port 8080");

    while (true) {
      Socket client = server.accept();
      handle(client);
    }
  }

  private static void handle (Socket client) {
    try {
      BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream()));
      OutputStream out = client.getOutputStream();

      String requestLine = in.readLine();
      if (requestLine == null || requestLine.isEmpty()) {
        client.close();
        return;
      }

      String[] parts = requestLine.split(" ");
      String method = parts[0];
      String path = parts[1];
      String version = parts[2];

      Map<String, String> headers = new HashMap<>();
      String line;
      while (!(line = in.readLine()).isEmpty()) {
        int idx = line.indexOf(":");
        if (idx > 0) {
          headers.put(line.substring(0,idx), line.substring(idx +1).trim());
        }
      }
      
      if (method.equals("GET")) {
        byte[] body = "<h1>Hello world</h1>".getBytes();
        String response = "HTTP/1.1 200 OK\r\n" + "Content-Type: text/html\r\n" + "Content-Length: " + body.length + "\r\n" + "\r\n";
        out.write(response.getBytes());
        out.write(body);
      }

      if (method.equals("HEAD")) {
        String response = "HTTP/1.1 200 OK\r\n" + "Content-Type: text/html\r\n" + "Content-Length: 13\r\n" + "\r\n";
        out.write(response.getByes());
      }
      if (method.equals("POST")) {
        String response = "HTTP/1.1 200 OK\r\n" + "Content-Type: text/plain\r\n" + "Content-Length: 2\r\n" + "\r\nOK";
        out.write(response.getBytes());
      }
      out.flush();
      client.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}

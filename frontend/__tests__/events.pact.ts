import { PactV3, MatchersV3 } from "@pact-foundation/pact";

describe("Pact - Events API", () => {
  const provider = new PactV3({
    consumer: "AccessibleTicketingFrontend",
    provider: "AccessibleTicketingBackend",
  });

  test("GET /events returns events list", async () => {
    provider.addInteraction({
      states: [{ description: "events exist" }],
      uponReceiving: "A request for all events",
      withRequest: {
        method: "GET",
        path: "/events",
      },
      willRespondWith: {
        status: 200,
        body: MatchersV3.eachLike({
          id: MatchersV3.number(),
          title: MatchersV3.string("ACME Music Festival"),
          date: MatchersV3.string("2025-10-05"),
          location: MatchersV3.string("London"),
        }),
      },
    });

    // Pact V3 standard pattern
    await provider.executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/events`);
      const body = await response.json();

      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("title");
      expect(body[0]).toHaveProperty("date");
      expect(body[0]).toHaveProperty("location");
    });
  });
});

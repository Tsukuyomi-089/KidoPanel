import { describe, expect, it } from "vitest";
import { extrairePublicationsHoteNonLoopbackDepuisInspection } from "./extraire-publications-hote-depuis-inspection-docker.js";

describe("extrairePublicationsHoteNonLoopbackDepuisInspection", () => {
  it("ignore les liaisons uniquement sur 127.0.0.1", () => {
    const inspection = {
      NetworkSettings: {
        Ports: {
          "25565/tcp": [{ HostIp: "127.0.0.1", HostPort: "41234" }],
        },
      },
    };
    expect(
      extrairePublicationsHoteNonLoopbackDepuisInspection(
        inspection as Parameters<
          typeof extrairePublicationsHoteNonLoopbackDepuisInspection
        >[0],
      ),
    ).toEqual([]);
  });

  it("retient un port hôte publié sur 0.0.0.0", () => {
    const inspection = {
      NetworkSettings: {
        Ports: {
          "25565/tcp": [{ HostIp: "0.0.0.0", HostPort: "45123" }],
        },
      },
    };
    expect(
      extrairePublicationsHoteNonLoopbackDepuisInspection(
        inspection as Parameters<
          typeof extrairePublicationsHoteNonLoopbackDepuisInspection
        >[0],
      ),
    ).toEqual([{ numero: 45123, protocole: "tcp" }]);
  });
});

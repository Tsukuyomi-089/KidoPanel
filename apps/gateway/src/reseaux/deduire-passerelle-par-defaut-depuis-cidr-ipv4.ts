/**
 * Déduit la passerelle IPv4 comme première adresse hôte du bloc (réseau + 1), alignée sur le moteur
 * (`deduirePasserelleParDefautDepuisCidr` dans validation-parametres-reseau-pont).
 * Employée lorsque la réponse JSON du moteur ne fournit pas encore une passerelle exploitable après sérialisation ou trim.
 */

function ipv4TexteVersUint32(ip: string): number | undefined {
  const parties = ip.trim().split(".");
  if (parties.length !== 4) {
    return undefined;
  }
  let acc = 0;
  for (const p of parties) {
    const n = Number.parseInt(p, 10);
    if (!Number.isFinite(n) || n < 0 || n > 255 || p !== String(n)) {
      return undefined;
    }
    acc = (acc << 8) | n;
  }
  return acc >>> 0;
}

function prefixeReseauIpv4VersMasque(prefixe: number): number | undefined {
  if (!Number.isInteger(prefixe) || prefixe < 0 || prefixe > 32) {
    return undefined;
  }
  if (prefixe === 0) {
    return 0;
  }
  return (~0 << (32 - prefixe)) >>> 0;
}

export function deduirePasserelleParDefautDepuisCidrIpv4(cidr: string): string | undefined {
  const segment = cidr.trim().split("/");
  if (segment.length !== 2) {
    return undefined;
  }
  const ipReseau = ipv4TexteVersUint32(segment[0]);
  const prefixe = Number.parseInt(segment[1], 10);
  if (ipReseau === undefined || !Number.isInteger(prefixe)) {
    return undefined;
  }
  const masque = prefixeReseauIpv4VersMasque(prefixe);
  if (masque === undefined) {
    return undefined;
  }
  const baseReseau = ipReseau & masque;
  const adrPasserelle = (baseReseau + 1) >>> 0;
  const octets = [
    (adrPasserelle >>> 24) & 0xff,
    (adrPasserelle >>> 16) & 0xff,
    (adrPasserelle >>> 8) & 0xff,
    adrPasserelle & 0xff,
  ];
  return octets.join(".");
}

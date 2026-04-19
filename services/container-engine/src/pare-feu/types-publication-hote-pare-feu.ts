/** Protocole réseau pour une règle « port » firewalld. */
export type ProtocolePublicationHote = "tcp" | "udp";

/** Publication TCP/UDP vue côté hôte après mapping Docker (à ouvrir sur le pare-feu). */
export type PublicationHotePareFeu = {
  numero: number;
  protocole: ProtocolePublicationHote;
};

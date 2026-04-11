/** Résumé conteneur tel que renvoyé par `GET /containers` (moteur / passerelle). */
export type ResumeConteneurLab = {
  id: string;
  state: string;
  status: string;
  names: string[];
  image: string;
};

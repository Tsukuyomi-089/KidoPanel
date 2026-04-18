import {
  useFluxJournauxConteneur,
  type OptionsFluxJournauxConteneur,
} from "../../hooks/useFluxJournauxConteneur.js";

type OptionsSansId = Omit<
  OptionsFluxJournauxConteneur,
  "idConteneur" | "varianteFlux"
>;

/**
 * Flux SSE des journaux conteneur pour une instance web (relais `/web-instances/…/logs/stream`).
 */
export function useConsoleWebInstance(
  params: OptionsSansId & { idInstanceWeb: string },
): ReturnType<typeof useFluxJournauxConteneur> {
  const { idInstanceWeb, ...rest } = params;
  return useFluxJournauxConteneur({
    ...rest,
    idConteneur: idInstanceWeb,
    varianteFlux: "instanceWeb",
  });
}

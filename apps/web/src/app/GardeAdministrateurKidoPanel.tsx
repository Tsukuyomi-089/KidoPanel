import { Navigate, Outlet } from "react-router-dom";
import { extraireRoleDepuisJetonClient } from "../passerelle/lectureRoleJetonClient.js";
import { lireJetonStockage } from "../lab/passerelleClient.js";

/**
 * Restreint les routes enfants aux jetons dont le rôle ADMIN est attesté dans le corps JWT décodé localement.
 */
export function GardeAdministrateurKidoPanel() {
  const jeton = lireJetonStockage();
  const role = extraireRoleDepuisJetonClient(jeton);
  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

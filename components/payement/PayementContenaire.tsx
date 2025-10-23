import React, { useEffect } from "react";
import PayementView from "./PayementView";

export default function PayementContenaire() {
  // Ici tu peux plus tard ajouter la logique pour scanner le QR code
  const handleScan = () => {
    console.log("🔍 Scanner le code QR");
  };



  return <PayementView onScan={handleScan} />;
}

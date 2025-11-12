"use client";
import { useState } from "react";
import Stays from "../_components/slot/stays";

export default function AdminPage() {
    // TODO: Replace with actual parking selection logic
    const [selectedParking, setSelectedParking] = useState<string | null>("cmho397rl0000a4h08jnjzoam");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
      <p>Welcome to the admin dashboard.</p>
      {selectedParking && (
          <Stays selectedParking={selectedParking} />
        )}
    </div>
  );
}
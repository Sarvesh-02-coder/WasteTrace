import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { WasteTicket } from "../../types";
import { Map as MapIcon, Clock, Package, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, useMap, CircleMarker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

interface HeatmapViewProps {
  tickets: WasteTicket[];
}

// Helper to format classification JSON
const formatClassification = (classification: string | undefined) => {
  if (!classification) return "NA";
  try {
    const parsed: Record<string, number> = JSON.parse(classification);
    const filtered = Object.entries(parsed).filter(([_, count]) => count > 0);
    if (filtered.length === 0) return "No Waste";
    return filtered
      .map(([cat, count]) => `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${count}`)
      .join(", ");
  } catch {
    return classification;
  }
};

const HeatLayer: React.FC<{ tickets: WasteTicket[] }> = ({ tickets }) => {
  const map = useMap();

  useEffect(() => {
    const heatPoints = tickets
      .filter((t) => t.location)
      .map((t) => [
        t.location!.lat,
        t.location!.lng,
        t.status === "pending" ? 0.8 : t.status === "collected" ? 0.5 : 0.3,
      ]);

    const heat = (L as any).heatLayer(heatPoints, {
      radius: 35,
      blur: 20,
      maxZoom: 17,
      gradient: {
        0.3: "green",   // recycled
        0.5: "yellow",  // collected
        0.8: "red",     // pending
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [tickets, map]);

  return null;
};

export const HeatmapView: React.FC<HeatmapViewProps> = ({ tickets }) => {
  const getMarkerColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-destructive";
      case "collected":
        return "bg-warning";
      case "recycled":
        return "bg-success";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "collected":
        return <Package className="w-4 h-4" />;
      case "recycled":
        return <Package className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapIcon className="w-5 h-5" />
            <span>City Waste Heatmap</span>
          </CardTitle>
          <CardDescription>
            Real-time visualization of waste distribution across the city
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapContainer
            center={[22.9734, 78.6569]} // Center of India
            zoom={5}
            scrollWheelZoom={true}
            className="h-96 w-full rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Heatmap */}
            <HeatLayer tickets={tickets} />

            {/* CircleMarkers */}
            {tickets
              .filter((t) => t.location)
              .map((ticket) => (
                <CircleMarker
                  key={ticket.id}
                  center={[ticket.location!.lat, ticket.location!.lng]}
                  radius={10}
                  pathOptions={{
                    color:
                      ticket.status === "pending"
                        ? "red"
                        : ticket.status === "collected"
                        ? "yellow"
                        : "green",
                    fillColor:
                      ticket.status === "pending"
                        ? "red"
                        : ticket.status === "collected"
                        ? "yellow"
                        : "green",
                    fillOpacity: 0.8,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                    <strong>{formatClassification(ticket.classification)}</strong> — {ticket.status}
                  </Tooltip>
                </CircleMarker>
              ))}
          </MapContainer>

          {/* Map Legend */}
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span className="text-sm">Pending Collection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-sm">Collected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm">Recycled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live updates from the waste tracking system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getMarkerColor(ticket.status)}`}></div>
                  <div>
                    <span className="font-mono text-sm">{ticket.wasteId}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-sm">{formatClassification(ticket.classification)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {ticket.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(ticket.timestamps.created).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

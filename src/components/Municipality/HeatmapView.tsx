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

const mapMarkers = [
  { id: 1, lat: 28.6139, lng: 77.2090, status: "pending", count: 5, area: "Central Delhi" },
  { id: 2, lat: 28.5355, lng: 77.3910, status: "collected", count: 3, area: "Noida" },
  { id: 3, lat: 28.4595, lng: 77.0266, status: "recycled", count: 6, area: "Gurgaon" },
  { id: 4, lat: 28.7041, lng: 77.1025, status: "pending", count: 4, area: "North Delhi" },
  { id: 5, lat: 28.6304, lng: 77.2177, status: "collected", count: 2, area: "Connaught Place" },
];

const HeatLayer: React.FC<{ markers: typeof mapMarkers }> = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    const heatPoints = markers.map((m) => [
      m.lat,
      m.lng,
      m.status === "pending" ? 0.8 : m.status === "collected" ? 0.5 : 0.3,
    ]);

    const heat = (L as any).heatLayer(heatPoints, {
      radius: 35,
      blur: 20,
      maxZoom: 17,
      gradient: {
        0.3: "green",  // recycled
        0.5: "yellow", // collected
        0.8: "red",    // pending
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [markers, map]);

  return null;
};

export const HeatmapView: React.FC<HeatmapViewProps> = ({ tickets }) => {
  const getMarkerColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-destructive";
      case "collected": return "bg-warning";
      case "recycled": return "bg-success";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <AlertCircle className="w-4 h-4" />;
      case "collected": return <Package className="w-4 h-4" />;
      case "recycled": return <Package className="w-4 h-4" />;
      default: return null;
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
          {/* Interactive Map */}
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
            <HeatLayer markers={mapMarkers} />

            {/* Colored CircleMarkers */}
            {mapMarkers.map((marker) => (
              <CircleMarker
                key={marker.id}
                center={[marker.lat, marker.lng]}
                radius={10}
                pathOptions={{
                  color:
                    marker.status === "pending"
                      ? "red"
                      : marker.status === "collected"
                      ? "yellow"
                      : "green",
                  fillColor:
                    marker.status === "pending"
                      ? "red"
                      : marker.status === "collected"
                      ? "yellow"
                      : "green",
                  fillOpacity: 0.8,
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <strong>{marker.area}</strong> — {marker.count} {marker.status}
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

      {/* Area-wise Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mapMarkers.map((area) => (
          <Card key={area.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{area.area}</h4>
                <Badge className={getMarkerColor(area.status)}>
                  {getStatusIcon(area.status)}
                  <span className="ml-1 capitalize">{area.status}</span>
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Items:</span>
                  <span className="font-medium">{area.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span className="text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {Math.floor(Math.random() * 60)} min ago
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className={area.status === "pending" ? "text-destructive" : "text-success"}>
                    {area.status === "pending" ? "High" : "Normal"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Updates */}
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
                    <span className="text-sm">{ticket.classification}</span>
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

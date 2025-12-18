import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, MapPin, Layers } from "lucide-react";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapReport {
  id: string;
  tracking_id: string;
  title: string;
  category: string;
  status: string;
  priority: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  created_at: string;
  lga: { name: string; id: string } | null;
}

interface LGA {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  submitted: "#EAB308",
  assigned: "#3B82F6",
  in_progress: "#F97316",
  resolved: "#22C55E",
  closed: "#6B7280",
};

const categoryLabels: Record<string, string> = {
  illegal_dumping: "Illegal Dumping",
  blocked_drainage: "Blocked Drainage",
  open_defecation: "Open Defecation",
  noise_pollution: "Noise Pollution",
  sanitation_issues: "Sanitation Issues",
  environmental_nuisance: "Environmental Nuisance",
};

const createCustomIcon = (status: string) => {
  const color = statusColors[status] || "#6B7280";
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Component to fit map bounds to markers
const FitBounds = ({ reports }: { reports: MapReport[] }) => {
  const map = useMap();
  
  useEffect(() => {
    const validReports = reports.filter(r => r.latitude && r.longitude);
    if (validReports.length > 0) {
      const bounds = L.latLngBounds(
        validReports.map(r => [r.latitude!, r.longitude!])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [reports, map]);
  
  return null;
};

const ReportsMap = () => {
  const [reports, setReports] = useState<MapReport[]>([]);
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lgaFilter, setLgaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Jigawa State center coordinates
  const jigawaCenter: [number, number] = [12.228, 9.561];

  useEffect(() => {
    fetchReports();
    fetchLgas();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id,
          tracking_id,
          title,
          category,
          status,
          priority,
          latitude,
          longitude,
          address,
          created_at,
          lga:lgas(id, name)
        `)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) throw error;
      setReports((data || []) as MapReport[]);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLgas = async () => {
    try {
      const { data } = await supabase.from("lgas").select("id, name").order("name");
      setLgas(data || []);
    } catch (error) {
      console.error("Error fetching LGAs:", error);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (categoryFilter !== "all" && report.category !== categoryFilter) return false;
      if (lgaFilter !== "all" && report.lga?.id !== lgaFilter) return false;
      if (statusFilter !== "all" && report.status !== statusFilter) return false;
      return true;
    });
  }, [reports, categoryFilter, lgaFilter, statusFilter]);

  // Calculate hotspots (areas with multiple reports)
  const hotspots = useMemo(() => {
    const grid: Record<string, MapReport[]> = {};
    filteredReports.forEach(report => {
      if (report.latitude && report.longitude) {
        // Round to create grid cells (approximately 1km)
        const key = `${Math.round(report.latitude * 100) / 100},${Math.round(report.longitude * 100) / 100}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(report);
      }
    });
    return Object.entries(grid)
      .filter(([, reports]) => reports.length >= 3)
      .map(([key, reports]) => ({
        key,
        center: key.split(",").map(Number) as [number, number],
        count: reports.length,
        reports,
      }));
  }, [filteredReports]);

  if (loading) {
    return (
      <div className="h-[600px] bg-secondary/50 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={lgaFilter} onValueChange={setLgaFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All LGAs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All LGAs</SelectItem>
            {lgas.map(lga => (
              <SelectItem key={lga.id} value={lga.id}>{lga.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {filteredReports.length} reports
          </span>
          {hotspots.length > 0 && (
            <span className="flex items-center gap-1 text-orange-600">
              <Layers className="w-4 h-4" />
              {hotspots.length} hotspots
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="h-[600px] rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={jigawaCenter}
          zoom={8}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <FitBounds reports={filteredReports} />

          {/* Regular markers */}
          {filteredReports.map((report) => (
            report.latitude && report.longitude && (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createCustomIcon(report.status)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-mono text-xs text-primary font-medium">
                      {report.tracking_id}
                    </p>
                    <p className="font-medium text-foreground mt-1">{report.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {categoryLabels[report.category]}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        style={{ backgroundColor: statusColors[report.status] }}
                        className="text-white text-xs"
                      >
                        {report.status.replace("_", " ")}
                      </Badge>
                    </div>
                    {report.address && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.address}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Hotspot markers */}
          {hotspots.map((hotspot) => (
            <Marker
              key={hotspot.key}
              position={hotspot.center}
              icon={L.divIcon({
                className: "hotspot-marker",
                html: `
                  <div style="
                    background-color: rgba(220, 38, 38, 0.8);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                  ">${hotspot.count}</div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
              })}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-medium text-red-600 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Hotspot Area
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hotspot.count} reports in this area
                  </p>
                  <div className="mt-2 space-y-1 max-h-[150px] overflow-y-auto">
                    {hotspot.reports.slice(0, 5).map(r => (
                      <p key={r.id} className="text-xs text-foreground">
                        • {r.tracking_id}: {r.title.slice(0, 30)}...
                      </p>
                    ))}
                    {hotspot.count > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{hotspot.count - 5} more
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <span className="text-muted-foreground">Status Legend:</span>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="capitalize">{status.replace("_", " ")}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">3</span>
          <span>Hotspot (3+ reports)</span>
        </div>
      </div>
    </div>
  );
};

export default ReportsMap;

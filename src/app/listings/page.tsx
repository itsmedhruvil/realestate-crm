import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models";
import Link from "next/link";
import { Building2, MapPin, Bed, Maximize2 } from "lucide-react";

interface IPropertyDoc {
  _id: string;
  name: string;
  location?: string;
  price?: string;
  type?: string;
  status: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  images?: string[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: "Available", className: "text-background bg-foreground" },
  reserved: { label: "Reserved", className: "text-background bg-foreground/70" },
  sold: { label: "Sold", className: "text-background bg-muted-foreground/50" },
};

export default async function ListingsPage() {
  await connectDB();
  const properties = await Property.find({ status: "available" }).sort({ createdAt: -1 }).lean();

  const listings = properties.map((p: any) => ({
    id: p._id.toString(),
    name: p.name,
    location: p.location || "",
    price: p.price || "",
    type: p.type || "",
    status: p.status,
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft,
    images: p.images || [],
  }));

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-foreground text-background">
                <Building2 className="h-3.5 w-3.5" />
              </span>
              PropDesk Listings
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
            Available Properties
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            Browse our current listings. Interested in a property? Click to view details and submit an inquiry.
          </p>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="mx-auto max-w-6xl px-4 lg:px-6 py-8">
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No properties currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((p) => (
              <Link
                key={p.id}
                href={`/listings/${p.id}`}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/50 transition-all duration-200"
              >
                <div className="h-48 relative border-b border-border overflow-hidden bg-muted">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-foreground/20" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[p.status]?.className || "text-background bg-foreground"}`}>
                      {statusConfig[p.status]?.label || p.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-lg font-semibold text-foreground tracking-tight">{p.price || "-"}</p>
                  <p className="text-sm font-medium text-foreground/80 mt-0.5">{p.name}</p>
                  {p.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3" /> {p.location}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{p.beds ?? "-"} Beds</span>
                    <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" />{p.sqft?.toLocaleString() ?? "-"} sqft</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} PropDesk. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
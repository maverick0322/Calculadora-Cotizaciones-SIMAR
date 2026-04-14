import { Database } from 'better-sqlite3'; 
import { IQuoteRepository } from '../../../domain/repositories/IQuoteRepository';
import { 
  QuoteDraft, 
  QuoteSummary, 
  ActivityType, 
  WasteType, 
  VolumeUnit, 
  ServiceFrequency, 
  QuoteStatus, 
  RoadType
} from '../../../../shared/types/Quote';

interface RawQuoteRow {
  id: number;
  folio: string | null;
  street: string;
  neighborhood: string;
  municipality: string;
  activity_type: string;
  waste_type: string;
  volume_quantity: number;
  volume_unit: string;
  service_frequency: string;
  created_at: number;
  status: string;
  replaces_quote_id: number | null;
  
  trip_kilometers: number | null;
  trip_vehicles: number | null;
  trip_crew_members: number | null;
  trip_routes: number | null;
  trip_fuel_liters: number | null;
  trip_road_type: string | null;
  trip_tolls: number | null;
  trip_total_toll_cost: number | null;
  trip_origin: string | null;
  trip_destination_warehouse: string | null;
}

export class SqliteQuoteRepository implements IQuoteRepository {

  constructor(private readonly db: Database) {}

  saveDraft(quote: QuoteDraft): number | bigint {
    const params = {
      street: quote.location.street,
      neighborhood: quote.location.neighborhood,
      municipality: quote.location.municipality,
      activity: quote.activity,
      waste: quote.waste,
      quantity: quote.volumeQuantity,
      unit: quote.volumeUnit,
      frequency: quote.frequency,
      createdAt: quote.createdAt || Date.now(),
      replacesQuoteId: quote.replacesQuoteId ?? null,
      
      tripKilometers: quote.trip?.kilometers ?? null,
      tripVehicles: quote.trip?.vehicles ?? null,
      tripCrewMembers: quote.trip?.crewMembers ?? null,
      tripRoutes: quote.trip?.routes ?? null,
      tripFuelLiters: quote.trip?.fuelLiters ?? null,
      tripRoadType: quote.trip?.roadType ?? null,
      tripTolls: quote.trip?.tolls ?? null,
      tripTotalTollCost: quote.trip?.totalTollCost ?? null,
      tripOrigin: quote.trip?.origin ?? null,
      tripDestinationWarehouse: quote.trip?.destinationWarehouse ?? null
    };

    if (quote.id) {
      const stmt = this.db.prepare(`
        UPDATE quotes SET
          street = @street, 
          neighborhood = @neighborhood, 
          municipality = @municipality,
          activity_type = @activity, 
          waste_type = @waste, 
          volume_quantity = @quantity,
          volume_unit = @unit, 
          service_frequency = @frequency, 
          replaces_quote_id = @replacesQuoteId,
          trip_kilometers = @tripKilometers, 
          trip_vehicles = @tripVehicles, 
          trip_crew_members = @tripCrewMembers, 
          trip_routes = @tripRoutes,
          trip_fuel_liters = @tripFuelLiters, 
          trip_road_type = @tripRoadType, 
          trip_tolls = @tripTolls, 
          trip_total_toll_cost = @tripTotalTollCost,
          trip_origin = @tripOrigin, 
          trip_destination_warehouse = @tripDestinationWarehouse
        WHERE id = @id AND status = 'draft'
      `);

      stmt.run({ ...params, id: quote.id });
      
      return typeof quote.id === 'string' ? parseInt(quote.id, 10) : quote.id;
    } 
    
    const stmt = this.db.prepare(`
      INSERT INTO quotes (
        street, neighborhood, municipality, 
        activity_type, waste_type, volume_quantity, 
        volume_unit, service_frequency, created_at, status, replaces_quote_id,
        trip_kilometers, trip_vehicles, trip_crew_members, trip_routes,
        trip_fuel_liters, trip_road_type, trip_tolls, trip_total_toll_cost,
        trip_origin, trip_destination_warehouse
      ) VALUES (
        @street, @neighborhood, @municipality, 
        @activity, @waste, @quantity, 
        @unit, @frequency, @createdAt, 'draft', @replacesQuoteId,
        @tripKilometers, @tripVehicles, @tripCrewMembers, @tripRoutes,
        @tripFuelLiters, @tripRoadType, @tripTolls, @tripTotalTollCost,
        @tripOrigin, @tripDestinationWarehouse
      )
    `);

    const info = stmt.run(params);
    return info.lastInsertRowid;
  }

  getDrafts(): QuoteSummary[] {
    const stmt = this.db.prepare(`
      SELECT 
        id, 
        folio, 
        (street || ', ' || neighborhood || ', ' || municipality) AS location, 
        waste_type AS waste, 
        (volume_quantity || ' ' || volume_unit) AS volume,
        created_at AS createdAt, 
        status
      FROM quotes 
      WHERE status = 'draft' 
      ORDER BY created_at DESC
    `);

    return stmt.all() as QuoteSummary[];
  }

  getDraftById(id: number): QuoteDraft | null {
    const stmt = this.db.prepare(`
      SELECT * FROM quotes WHERE id = ? AND status = 'draft'
    `);
    
    const row = stmt.get(id) as RawQuoteRow | undefined;

    if (!row) return null;

    const hasTrip = row.trip_kilometers !== null;

    return {
      id: row.id,
      folio: row.folio || undefined,
      replacesQuoteId: row.replaces_quote_id || undefined,
      location: {
        street: row.street,
        neighborhood: row.neighborhood,
        municipality: row.municipality
      },
      activity: row.activity_type as ActivityType,
      waste: row.waste_type as WasteType,
      volumeQuantity: row.volume_quantity,
      volumeUnit: row.volume_unit as VolumeUnit,
      frequency: row.service_frequency as ServiceFrequency,
      createdAt: row.created_at,
      status: row.status as QuoteStatus,
      
      trip: hasTrip ? {
        kilometers: row.trip_kilometers as number,
        vehicles: row.trip_vehicles as number,
        crewMembers: row.trip_crew_members as number,
        routes: row.trip_routes as number,
        fuelLiters: row.trip_fuel_liters as number,
        roadType: row.trip_road_type as RoadType,
        tolls: row.trip_tolls ?? undefined,
        totalTollCost: row.trip_total_toll_cost ?? undefined,
        origin: row.trip_origin as string,
        destinationWarehouse: row.trip_destination_warehouse as string
      } : undefined
    };
  }

  getQuoteById(id: number): QuoteDraft | null {
    const stmt = this.db.prepare(`SELECT * FROM quotes WHERE id = ?`);
    const row = stmt.get(id) as any;

    if (!row) return null;
    const hasTrip = row.trip_kilometers !== null;

    return {
      id: row.id,
      folio: row.folio || undefined,
      replacesQuoteId: row.replaces_quote_id || undefined,
      location: { street: row.street, neighborhood: row.neighborhood, municipality: row.municipality },
      activity: row.activity_type, waste: row.waste_type, volumeQuantity: row.volume_quantity,
      volumeUnit: row.volume_unit, frequency: row.service_frequency, createdAt: row.created_at,
      status: row.status,
      trip: hasTrip ? {
        kilometers: row.trip_kilometers, vehicles: row.trip_vehicles, crewMembers: row.trip_crew_members,
        routes: row.trip_routes, fuelLiters: row.trip_fuel_liters, roadType: row.trip_road_type,
        tolls: row.trip_tolls ?? undefined, totalTollCost: row.trip_total_toll_cost ?? undefined,
        origin: row.trip_origin, destinationWarehouse: row.trip_destination_warehouse
      } : undefined
    };
  }

  issueQuote(id: number): boolean {
    const checkStmt = this.db.prepare(`SELECT replaces_quote_id FROM quotes WHERE id = ?`);
    const row = checkStmt.get(id) as { replaces_quote_id: number | null };

    const issueStmt = this.db.prepare(`UPDATE quotes SET status = 'issued' WHERE id = ? AND status = 'draft'`);
    const replaceStmt = this.db.prepare(`UPDATE quotes SET status = 'replaced' WHERE id = ?`);

    const transaction = this.db.transaction(() => {
      const info = issueStmt.run(id);
      
      if (info.changes > 0 && row && row.replaces_quote_id) {
        replaceStmt.run(row.replaces_quote_id);
      }
      return info.changes > 0; 
    });

    return transaction();
  }

  getIssuedQuotes(): QuoteSummary[] {
    const stmt = this.db.prepare(`
      SELECT 
        id, 
        folio, 
        (street || ', ' || neighborhood || ', ' || municipality) AS location, 
        waste_type AS waste, 
        (volume_quantity || ' ' || volume_unit) AS volume,
        created_at AS createdAt, 
        status
      FROM quotes 
      WHERE status = 'issued' 
      ORDER BY created_at DESC
    `);

    return stmt.all() as QuoteSummary[];
  }
}
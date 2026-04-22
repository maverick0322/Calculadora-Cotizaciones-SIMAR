import { Database } from 'better-sqlite3'; 
import { IQuoteRepository } from '../../../domain/repositories/IQuoteRepository';
import { 
  QuoteDraft, 
  QuoteSummary, 
  ActivityType, 
  ServiceFrequency, 
  QuoteStatus, 
  RoadType
} from '../../../../shared/types/Quote';

interface RawQuoteRow {
  id: number;
  folio: string | null;
  client_name: string;
  client_rfc: string;
  street: string;
  neighborhood: string;
  municipality: string;
  activity_type: string;
  wastes_json: string;
  service_frequency: string;
  created_at: number;
  status: string;
  replaces_quote_id: number | null;
  
  trip_kilometers: number | null;
  trip_vehicles: number | null;
  trip_crew_members: number | null;
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
      clientName: quote.clientName,
      clientRfc: quote.clientRfc,
      street: quote.location.street,
      neighborhood: quote.location.neighborhood,
      municipality: quote.location.municipality,
      activity: quote.activity,
      wastesJson: JSON.stringify(quote.wastes),
      frequency: quote.frequency,
      createdAt: quote.createdAt || Date.now(),
      replacesQuoteId: quote.replacesQuoteId ?? null,
      
      tripKilometers: quote.trip?.kilometers ?? null,
      tripVehicles: quote.trip?.vehicles ?? null,
      tripCrewMembers: quote.trip?.crewMembers ?? null,
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
          client_name = @clientName,
          client_rfc = @clientRfc,
          street = @street, 
          neighborhood = @neighborhood, 
          municipality = @municipality,
          activity_type = @activity, 
          wastes_json = @wastesJson, 
          service_frequency = @frequency, 
          replaces_quote_id = @replacesQuoteId,
          trip_kilometers = @tripKilometers, 
          trip_vehicles = @tripVehicles, 
          trip_crew_members = @tripCrewMembers, 
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
        client_name, client_rfc, street, neighborhood, municipality, 
        activity_type, wastes_json, service_frequency, created_at, status, replaces_quote_id,
        trip_kilometers, trip_vehicles, trip_crew_members,
        trip_fuel_liters, trip_road_type, trip_tolls, trip_total_toll_cost,
        trip_origin, trip_destination_warehouse
      ) VALUES (
        @clientName, @clientRfc, @street, @neighborhood, @municipality, 
        @activity, @wastesJson, @frequency, @createdAt, 'draft', @replacesQuoteId,
        @tripKilometers, @tripVehicles, @tripCrewMembers,
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
        wastes_json,
        created_at AS createdAt, 
        status
      FROM quotes 
      WHERE status = 'draft' 
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map(row => {
      const wastes = JSON.parse(row.wastes_json || '[]');
      const wastesSummary = wastes.map((w: any) => `${w.quantity} ${w.unit} de ${w.name}`).join(' | ');
      return {
        id: row.id,
        folio: row.folio,
        location: row.location,
        wastesSummary: wastesSummary || 'Sin residuos',
        createdAt: row.createdAt,
        status: row.status
      };
    });
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
      clientName: row.client_name,
      clientRfc: row.client_rfc,
      location: {
        street: row.street,
        neighborhood: row.neighborhood,
        municipality: row.municipality
      },
      activity: row.activity_type as ActivityType,
      wastes: JSON.parse(row.wastes_json || '[]'),
      frequency: row.service_frequency as ServiceFrequency,
      createdAt: row.created_at,
      status: row.status as QuoteStatus,
      
      trip: hasTrip ? {
        kilometers: row.trip_kilometers as number,
        vehicles: row.trip_vehicles as number,
        crewMembers: row.trip_crew_members as number,
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
      clientName: row.client_name,
      clientRfc: row.client_rfc,
      location: { street: row.street, neighborhood: row.neighborhood, municipality: row.municipality },
      activity: row.activity_type, 
      wastes: JSON.parse(row.wastes_json || '[]'),
      frequency: row.service_frequency, 
      createdAt: row.created_at,
      status: row.status,
      trip: hasTrip ? {
        kilometers: row.trip_kilometers, vehicles: row.trip_vehicles, crewMembers: row.trip_crew_members,
        fuelLiters: row.trip_fuel_liters, roadType: row.trip_road_type,
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
        wastes_json,
        created_at AS createdAt, 
        status
      FROM quotes 
      WHERE status = 'issued' 
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map(row => {
      const wastes = JSON.parse(row.wastes_json || '[]');
      const wastesSummary = wastes.map((w: any) => `${w.quantity} ${w.unit} de ${w.name}`).join(' | ');
      return {
        id: row.id,
        folio: row.folio,
        location: row.location,
        wastesSummary: wastesSummary || 'Sin residuos',
        createdAt: row.createdAt,
        status: row.status
      };
    });
  }
}
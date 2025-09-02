// # TypeScript interfaces for tracking

/**
 * @interface TrackingPoint
 * @description Represents a single location update in the tracking history.
 */
export interface TrackingPoint {
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
}

/**
 * @interface PublicTrackingInfo
 * @description The combined data structure returned for a tracking request.
 */
export interface PublicTrackingInfo {
  parcelId: string;
  status: string;
  assignedAgent?: any; // Consider creating a lean agent DTO
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
  trackingHistory: TrackingPoint[];
}
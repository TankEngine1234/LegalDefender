
"use client";

import { useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1.5rem',
};

// Styling to match the "Abstract/Minimal" theme (hiding POIs to focus on data)
const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        }
    ]
};

interface MapProps {
    center: { lat: number, lng: number };
    markerPosition?: { lat: number, lng: number };
}

const libraries: ("places")[] = ["places"];

export default function GoogleMapComponent({ center, markerPosition }: MapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    // Keep reference to map to pan programmatically if needed in future
    const onLoad = useCallback((map: google.maps.Map) => {
        // bounds logic could go here
    }, []);

    const onUnmount = useCallback((map: google.maps.Map) => {
        // cleanup
    }, []);

    if (!isLoaded) {
        return (
            <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 rounded-3xl">
                Loading Google Maps...
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
        >
            {markerPosition && (
                <MarkerF
                    position={markerPosition}
                    animation={google.maps.Animation.DROP}
                />
            )}
        </GoogleMap>
    );
}

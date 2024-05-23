

// Replace with published asset info, for now the catalog API returns all uploaded assets
// {
//       "bucket_name": "ingest",
//       "content_hash": "d986cebb7d8afeee1808c27fa20b8281f1688fbd",
//       "created_at": "Wed, 22 May 2024 20:27:55 GMT",
//       "file_name": "Terrain_Sample.hda",
//       "file_type": "hda",
//       "id": 3,
//       "object_name": "d986cebb7d8afeee1808c27fa20b8281f1688fbd.hda",
//       "size": 84237,
//       "status": "upload_completed",
//       "updated_at": "Wed, 22 May 2024 20:27:55 GMT",
//       "uploaded_by": "unknown"
//     }

import {useEffect, useState} from "react";
import {CatalogService} from "../services/catalog";

export const MainPageAssetCollection = () => {

    const [catalog, setCatalog] = useState([]);
    useEffect(() => {
        CatalogService.getAll().then((response_json) => setCatalog(response_json.data.slice(0, 9)));
    }, []);

    const publicImage = (name) => {
        return <img className="w-9 shadow-2 border-round"
                    src={`${process.env.PUBLIC_URL}/geoffrey-bertrand-gerbaud-tile.jpeg`}
                    alt={name}/>
    }
    const itemTemplate = (asset) => {
        return (
            <li>{asset.file_name} {asset.size} bytes, uploaded {asset.updated_at}</li>
        );
    };


    return (
        <div className="asset-grid">
            <ul>
            {catalog.map((asset, index) => itemTemplate(asset))}
            </ul>
        </div>
    );
}

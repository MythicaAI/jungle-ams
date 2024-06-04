
import {useEffect, useState} from "react";
import {CatalogService} from "../services/catalogService";
import type {UploadAsset, UploadAssetList} from "../types/apiTypes";

export const AssetCollection: React.FC = () => {

    const [catalog, setCatalog] = useState<UploadAssetList>([]);
    useEffect(() => {
        CatalogService.getAll().then(response => {
            setCatalog(response.data);
        });
    }, []);

    const publicImage = (name: string) => {
        return <img className="w-9 shadow-2 border-round"
                    src={`${process.env.PUBLIC_URL}/geoffrey-bertrand-gerbaud-tile.jpeg`}
                    alt={name}/>
    }
    const itemTemplate = (asset: UploadAsset) => {
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

export default AssetCollection;
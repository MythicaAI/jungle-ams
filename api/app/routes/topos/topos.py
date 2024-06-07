from http import HTTPStatus
from http.client import HTTPException
from typing import Any

from db.schema.assets import Topology, AssetRef, AssetVersion, Asset
from sqlmodel import select, update
from pydantic import BaseModel, Json
from uuid import UUID
from db.connection import get_session
from fastapi import APIRouter, Depends

from db.schema.profiles import Profile
from routes.assets.assets import AssetVersionResult, asset_join_select
from routes.authorization import current_profile


class TopologyCreateRequest(BaseModel):
    name: str
    description: str | None = None
    org_id: UUID | None = None
    edge_data_schema: str | None = None


class TopologyUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    org_id: UUID | None = None
    edge_data_schema: str | None = None


class TopologyRef(BaseModel):
    src: UUID
    dst: UUID
    edge: Json[Any] | None = None


class TopologyCreateRefsRequest(BaseModel):
    topo_id: int
    refs: list[TopologyRef]


router = APIRouter(prefix="/topos", tags=["topology"])

@router.get("")
async def get_topologies() -> list[Topology]:
    with get_session() as session:
        return session.exec(select(Topology)).all()

@router.post("")
async def create_topology(
        create: TopologyCreateRequest,
        profile: Profile = Depends(current_profile)) -> Topology:
    with get_session() as session:
        topology = Topology(**create.model_dump(), owner=profile.id)
        session.add(topology)
        session.commit()
        session.refresh(topology)
        return topology


@router.get("{topo_id}")
async def get_topology(topo_id: int) -> Topology:
    with get_session() as session:
        return session.exec(select(Topology)).first()


@router.get("{topo_id}/refs")
async def get_topology(topo_id: int) -> list[AssetRef]:
    with get_session() as session:
        topo = session.exec(select(Topology)).first()
        if topo is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, "Topology not found")
        refs = session.exec(select(AssetRef).where(
            AssetRef.topo_id == topo.id)).all()
        return refs

@router.post("/{topo_id}/refs")
async def create_topo_refs(
        create_refs: TopologyCreateRefsRequest,
        profile: Profile = Depends(current_profile)) -> list[AssetRef]:
    with get_session() as session:

        refs = session.exec(select(AssetRef).where(
            AssetRef.topo_id == topo.id)).all()
        return refs

@router.post("{topo_id}")
async def update_topology(
        topo_id: int,
        topo: TopologyUpdateRequest,
        profile = Depends(current_profile)) -> Topology:
    with get_session() as session:
        r = session.exec(
            update(Topology).where(
                Topology.id == topo_id).where(
                Topology.owner == profile.id).values(**topo.model_dump()))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, "Topology not found or not owned")
        session.commit()
        return session.exec(select(Topology).where(Topology.id == topo_id)).first()


async def get_topology(owner: UUID) -> Topology:
    with get_session() as session:
        return session.exec(select(Topology)).first()

@router.get('/owned')
async def get_owned_topologies(
        profile = Depends(current_profile)) -> list[AssetVersionResult]:
    with get_session() as session:
        return session.exec(
            asset_join_select.where(
                Asset.id == AssetVersion.asset_id).where(
                Asset.owner == profile.id)).all()

@router.get('/owned/collections')
async def get_owned_collections(
        profile = Depends(current_profile)) -> list[AssetVersionResult]:
    with get_session() as session:
        return session.exec(
            asset_join_select.where(
                Asset.id == AssetVersion.asset_id).where(
                Asset.owner == profile.id)).all()
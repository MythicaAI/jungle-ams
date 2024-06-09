from http import HTTPStatus
from fastapi import HTTPException, Body, Response
from typing import Any

from db.schema.assets import Topology, AssetRef, AssetVersion, Asset
from sqlmodel import select, update
from pydantic import BaseModel, Json
from uuid import UUID
from db.connection import get_session
from fastapi import APIRouter, Depends

from db.schema.profiles import Profile, Org
from routes.assets.assets import AssetVersionResult, asset_join_select
from routes.authorization import current_profile

import re


class TopologyCreateRequest(BaseModel):
    name: str
    org_id: UUID
    description: str | None = None
    edge_data_schema: str | None = None


class TopologyUpdateRequest(BaseModel):
    name: str | None = None
    org_id: UUID | None = None
    description: str | None = None
    edge_data_schema: str | None = None


class TopologyRef(BaseModel):
    src: UUID
    dst: UUID
    edge: Json[Any] | None = None


router = APIRouter(prefix="/topos", tags=["topology"])

expression = re.compile(r'^[a-zA-Z-_]{1,63}$')


def validate_topo_name(name: str) -> bool:
    return expression.match(name) is not None


@router.get("/")
async def get_topologies() -> list[Topology]:
    with get_session() as session:
        return session.exec(select(Topology)).all()


@router.post("/", status_code=HTTPStatus.CREATED)
async def create_topology(
        create: TopologyCreateRequest,
        profile: Profile = Depends(current_profile)) -> Topology:
    with get_session() as session:
        org = session.exec(select(Org).where(Org.id == create.org_id)).first()
        if org is None:
            raise HTTPException(HTTPStatus.FAILED_DEPENDENCY, detail=f'missing org: {create.org_id}')
        if not validate_topo_name(create.name):
            raise HTTPException(HTTPStatus.BAD_REQUEST, detail=f'invalid topo name: {create.name}')
        if session.exec(select(Topology).where(Topology.name == create.name)).first() is not None:
            raise HTTPException(HTTPStatus.CONFLICT, detail=f'topology already exists: {create.name}')

        topology = Topology(**create.model_dump(), owner=profile.id)
        session.add(topology)
        session.commit()
        session.refresh(topology)
        return topology


@router.post("/{topo_id}")
async def update_topology(
        topo_id: int,
        req: TopologyUpdateRequest,
        profile: Profile = Depends(current_profile)) -> Topology:
    with get_session() as session:
        update_params = req.model_dump()

        # Handle the update to org_id
        if req.org_id is not None:
            org = session.exec(select(Org).where(Org.id == req.org_id)).first()
            if org is None:
                raise HTTPException(HTTPStatus.FAILED_DEPENDENCY, detail=f'missing org: {req.org_id}')
        else:
            update_params.pop('org_id', None)

        # Handle name updates, don't allow clearing of names
        if req.name is None:
            update_params.pop('name', None)
        else:
            if not validate_topo_name(req.name):
                raise HTTPException(HTTPStatus.BAD_REQUEST, detail=f'invalid topo name: {req.name}')
            if session.exec(select(Topology).where(Topology.name == req.name)).first() is not None:
                raise HTTPException(HTTPStatus.CONFLICT, detail=f'topology: {req.name} already exists')

        # Update the topology
        r = session.exec(
            update(Topology).where(
                Topology.id == topo_id).where(
                Topology.owner == profile.id).values(**req.model_dump()))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, "Topology not found or not owned")
        session.commit()
        return session.exec(select(Topology).where(Topology.id == topo_id)).first()


@router.get("/{topo_id}")
async def get_topology(topo_id: int) -> Topology:
    with get_session() as session:
        return session.exec(select(Topology)).first()


@router.get("/{topo_id}/refs")
async def get_topology(topo_id: int) -> list[AssetRef]:
    with get_session() as session:
        topo = session.exec(select(Topology).where(Topology.id == topo_id)).first()
        if topo is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, "Topology not found")
        refs = session.exec(select(AssetRef).where(
            AssetRef.topology_id == topo.id)).all()
        return refs


@router.post("/{topo_id}/refs/{src_id}/{dst_id}", status_code=HTTPStatus.CREATED)
async def create_topo_refs(
        topo_id: int,
        src_id: UUID,
        dst_id: UUID,
        edge_data: dict = Body(...),
        response: Response = Response(),
        profile: Profile = Depends(current_profile)) -> AssetRef:
    with get_session() as session:
        edge = session.exec(select(AssetRef).where(
            AssetRef.topology_id == topo_id, AssetRef.src == src_id, AssetRef.dst == dst_id)).first()
        if edge is None:
            edge = AssetRef(
                topology_id=topo_id,
                src=src_id,
                dst=dst_id,
                edge_data=edge_data)
            session.add(edge)
        else:
            edge.edge_data = edge_data
            session.add(edge)
            response.status = HTTPStatus.OK
        session.commit()
        session.refresh(edge)
        return edge


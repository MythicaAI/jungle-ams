import re
from datetime import datetime
from http import HTTPStatus
from typing import Any, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlmodel import select, update as sql_update

from cryptid.cryptid import org_id_to_seq, org_seq_to_id, profile_seq_to_id, topo_id_to_seq, topo_seq_to_id
from db.connection import get_session
from db.schema.graph import Topology, TopologyRef
from db.schema.profiles import Org, Profile
from routes.authorization import session_profile


class TopologyCreateUpdateRequest(BaseModel):
    name: str
    org_id: str
    description: str | None = None
    edge_data_schema: str | None = None


class TopologyResponse(BaseModel):
    topology_id: str
    owner_id: str
    org_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    edge_data_schema: Optional[str] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None


class TopologyRefResponse(BaseModel):
    src_id: str
    dst_id: str
    edge_data: Any | None = None


router = APIRouter(prefix="/topos", tags=["topology"])

expression = re.compile(r'^[a-zA-Z-_]{1,63}$')


def validate_topo_name(name: str) -> bool:
    """validate topology names against regex"""
    return expression.match(name) is not None


def topology_to_response(topology: Topology) -> TopologyResponse:
    """Convert database type to API type"""
    r = TopologyResponse(
        topology_id=topo_seq_to_id(topology.topology_seq),
        owner_id=profile_seq_to_id(topology.owner_seq),
        org_id=org_seq_to_id(topology.org_seq),
        name=topology.name,
        description=topology.description,
        edge_data_schema=topology.edge_data_schema,
        created=topology.created,
        updated=topology.updated)
    return r


def topology_refs_to_response(
        refs_result: list[TopologyRef]) -> list[TopologyRefResponse]:
    """Convert database ref type to API type"""
    responses = [TopologyRefResponse(
        topology_id=topo_seq_to_id(ref.topology_seq),
        **ref.model_dump()) for ref in refs_result]
    return responses


@router.get("/")
async def list_all() -> list[Topology]:
    """Get all valid topologies"""
    with get_session() as session:
        return session.exec(select(Topology)).all()


@router.post("/", status_code=HTTPStatus.CREATED)
async def create(
        create_req: TopologyCreateUpdateRequest,
        profile: Profile = Depends(session_profile)) -> TopologyResponse:
    """Create a new topology"""
    with get_session() as session:
        org_seq = org_id_to_seq(create_req.org_id)
        org = session.exec(select(Org).where(Org.org_seq == org_seq)).first()
        if org is None:
            raise HTTPException(HTTPStatus.FAILED_DEPENDENCY,
                                detail=f'missing org: {create_req.org_id}')
        if not validate_topo_name(create_req.name):
            raise HTTPException(HTTPStatus.BAD_REQUEST,
                                detail=f'invalid topo name: {create_req.name}')
        if session.exec(select(Topology).where(Topology.name == create_req.name)).first() is not None:
            raise HTTPException(
                HTTPStatus.CONFLICT, detail=f'topology already exists: {create_req.name}')

        topology = Topology(**create_req.model_dump(),
                            owner_seq=profile.profile_seq,
                            org_seq=org_seq)
        session.add(topology)
        session.commit()
        session.refresh(topology)
        return topology_to_response(topology)


@router.post("/{topo_id}")
async def update(
        topo_id: str,
        req: TopologyCreateUpdateRequest,
        profile: Profile = Depends(session_profile)) -> TopologyResponse:
    """Update an existing topology"""
    with get_session() as session:
        update_params = req.model_dump()

        # Handle the update to org_id
        if req.org_id is not None:
            org_seq = org_id_to_seq(req.org_id)
            org = session.exec(select(Org).where(Org.org_seq == org_seq)).first()
            if org is None:
                raise HTTPException(
                    HTTPStatus.FAILED_DEPENDENCY, detail=f'missing org: {req.org_id}')
            update_params['org_seq'] = org_seq
            update_params.pop('org_id')
        else:
            update_params.pop('org_id', None)

        # Handle name updates, don't allow clearing of names
        if req.name is None:
            update_params.pop('name', None)
        else:
            if not validate_topo_name(req.name):
                raise HTTPException(HTTPStatus.BAD_REQUEST,
                                    detail=f'invalid topo name: {req.name}')
            if session.exec(select(Topology).where(Topology.name == req.name)).first() is not None:
                raise HTTPException(HTTPStatus.CONFLICT, detail=f'topology: {req.name} already exists')

        # Update the topology
        topo_seq = topo_id_to_seq(topo_id)
        r = session.exec(
            sql_update(Topology).where(
                Topology.topology_seq == topo_seq).where(
                Topology.owner_seq == profile.profile_seq)
            .values(**update_params))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                "Topology not found or not owned")
        session.commit()
        db_topo = session.exec(select(Topology).where(
            Topology.topology_seq == topo_seq)).first()
        return topology_to_response(db_topo)


@router.get("/{topo_id}")
async def by_id(topo_id: str) -> TopologyResponse:
    """Get topology by ID"""
    with get_session() as session:
        topo_seq = topo_id_to_seq(topo_id)
        db_topo = session.exec(select(Topology).where(
            Topology.topology_seq == topo_seq)).first()
        return topology_to_response(db_topo)


@router.get("/{topo_id}/refs")
async def refs(topo_id: str) -> list[TopologyRefResponse]:
    """Get all topology refs"""
    with get_session() as session:
        topo_seq = topo_id_to_seq(topo_id)
        topo = session.exec(select(Topology).where(
            Topology.topology_seq == topo_seq)).first()
        if topo is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, "Topology not found")
        refs_result = session.exec(select(TopologyRef).where(
            TopologyRef.topology_seq == topo.topology_seq)).all()
        return topology_refs_to_response(refs_result)


@router.post("/{topo_id}/refs/{src_id}/{dst_id}", status_code=HTTPStatus.CREATED)
async def create_ref(
        topo_id: str,
        src_id: str,
        dst_id: str,
        edge_data: dict = Body(...),
        response: Response = Response(),
        profile: Profile = Depends(session_profile)) -> TopologyRefResponse:
    """Create a new topology ref"""
    with get_session() as session:
        topo_seq = topo_id_to_seq(topo_id)
        assert profile is not None
        edge = session.exec(select(TopologyRef).where(
            TopologyRef.topology_seq == topo_seq,
            TopologyRef.src_id == src_id, TopologyRef.dst_id == dst_id)).first()
        if edge is None:
            edge = TopologyRef(
                topology_seq=topo_seq,
                src_id=src_id,
                dst_id=dst_id,
                edge_data=edge_data)
            session.add(edge)
        else:
            edge.edge_data = edge_data
            session.add(edge)
            response.status = HTTPStatus.OK
        session.commit()
        session.refresh(edge)
        return TopologyRefResponse(**edge.model_dump())

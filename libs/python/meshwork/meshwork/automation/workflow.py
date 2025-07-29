import logging

from pydantic import BaseModel

from meshwork.models.params import FileParameter

# Set up logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
log = logging.getLogger(__name__)


class WorkflowPart(BaseModel):
    pass


class Node(WorkflowPart):
    id: str
    type: str
    data: dict
    parents: list["Node"] = []
    children: list["Node"] = []


class Edge(WorkflowPart):
    source_id: str
    target_id: str
    source_handle: str
    target_handle: str
    edge_type: str


class Workflow(BaseModel):
    nodes: dict[str, Node] = {}
    edges: list[Edge] = []

    def get_start_nodes(self) -> list[Node]:
        """
        Return nodes that have no parents.
        """
        return [node for node in self.nodes.values() if len(node.parents) == 0]

    def get_end_nodes(self) -> list[Node]:
        """
        Return nodes that have no children.
        """
        return [node for node in self.nodes.values() if len(node.children) == 0]


def parse(awful_json: dict) -> Workflow:
    """
    Given a dictionary that follows the React Flow structure:
      {
        "flow": {
          "nodes": [...],
          "edges": [...]
        }
      }
    return a Graph object.
    """
    flow = awful_json["flow"]
    node_list: list[dict] = flow["nodes"]
    edge_list: list[dict] = flow["edges"]
    mythica_flow: dict[dict] = awful_json["mythicaFlow"]["flowData"]

    graph = Workflow()

    # 1. Create Node objects
    for node_data in node_list:
        node_id = node_data["id"]
        node_type = node_data["type"]
        data = node_data.get("data", {})
        graph.nodes[node_id] = Node(id=node_id, type=node_type, data=data)
    # 2. Create Edge objects and build adjacency
    for edge_data in edge_list:
        try:
            source = edge_data["source"]
            target = edge_data["target"]
            source_handle = edge_data["sourceHandle"]
            target_handle = edge_data["targetHandle"]
            edge_type = edge_data["type"]

            graph.edges.append(
                Edge(
                    source_id=source,
                    target_id=target,
                    source_handle=source_handle,
                    target_handle=target_handle,
                    edge_type=edge_type,
                )
            )

            # Link nodes in adjacency
            source_node = graph.nodes[source]
            target_node = graph.nodes[target]
            source_node.children.append(target_node)
            target_node.parents.append(source_node)

            try:
                flow_data = mythica_flow[target][target_handle]
                if flow_data:
                    files: list[FileParameter] = [
                        {"file_id": item["file_id"]} for item in flow_data
                    ]
                    target_node.data["inputData"][target_handle] = files
            except Exception:
                log.debug("No flow data found for %s %s", target, target_handle)
        except Exception:
            log.warning("invalid edge: %s", str(edge_data))

    return graph

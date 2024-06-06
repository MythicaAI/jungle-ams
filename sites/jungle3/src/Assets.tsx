import {Box, Typography, List, ListItem, Table} from '@mui/joy';
import {Link} from "react-router-dom";

const assets = [
  { id: 1, name: 'Roof Tool', version: [1, 2 ,1], author: "Kevin" },
  { id: 2, name: 'Stair Tool', version: [0, 1, 1], author: "Max" },
  { id: 3, name: 'Flower Tool', version: [3, 0, 1], author: "Tori" }
];

const Assets = () => {
  return (
    <Box>
      <Table>s
          <thead>
          <tr>
              <th>Name</th>
              <th>Version</th>
              <th>Author</th>
          </tr>
          </thead>
        {assets.map(asset => (
            <tr key={asset.id}>
                <td><Link to={"/assets/:assetId:"}>{asset.name}</Link></td>
                <td>{asset.version}</td>
                <td>{asset.author}</td>
            </tr>
        ))}
      </Table>
    </Box>
  );
};

export default Assets;
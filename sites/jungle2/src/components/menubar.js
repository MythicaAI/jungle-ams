import { Menu } from '@ark-ui/react'

export const AppMenubar = () => (
  <Menu.Root>
    <Menu.Trigger>
      Open menu
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content>
        <Menu.Item id='react' value="react">React</Menu.Item>
        <Menu.Item id='solid' value="solid">Solid</Menu.Item>
        <Menu.Item id='vue' value="vue">Vue</Menu.Item>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
)

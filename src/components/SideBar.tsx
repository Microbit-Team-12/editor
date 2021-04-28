/* eslint-disable react/display-name, jsx-a11y/click-events-have-key-events */
import { Button, Drawer, List, ListItem, ListItemText } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import React, { useState } from 'react';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import { TutorialList, TutorialLocation } from '../tutorial';

export interface SideBarProps {
  tutorialList: TutorialList
  onTutorialSelection: (path: TutorialLocation) => void
}

export function SideBar(props: SideBarProps): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsSidebarOpen(true)}>
        <Menu/>
      </Button>
      <Drawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <List>
          {props.tutorialList.list.map((location) => {
            const { title } = location;
            return (
              <ListItem button key={title} onClick={() => props.onTutorialSelection(location)}>
                <ListItemText primary={title} />
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}

/* eslint-disable react/display-name, jsx-a11y/click-events-have-key-events */
import { Button, Drawer, List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import React, { useState } from 'react';
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
        Select Tutorial
      </Button>
      <Drawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <List subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            <h2>
              Available tutorials
            </h2>
          </ListSubheader>
        }>
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

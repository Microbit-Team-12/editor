/* eslint-disable react/display-name, jsx-a11y/click-events-have-key-events */
import { Book, Menu } from '@material-ui/icons';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Navigation } from 'react-minimal-side-navigation';
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
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-20 block transition-opacity bg-black opacity-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} />

      <div>
        <button
          className="btn-menu" type="button"
          onClick={(): void => setIsSidebarOpen(true)}
        >
          <Menu />
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 ease-out transform translate-x-0 bg-white border-r-2 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'ease-out translate-x-0' : 'ease-in -translate-x-full'}`}
      >
        <div className="flex items-center justify-center mt-10 text-center py-6">
          <Book />
          <span className="mx-2 text-2xl font-semibold text-black">
            Tutorials
          </span>
        </div>

        <Navigation
          activeItemId={props.tutorialList.default.path}
          onSelect={({ itemId }) => {
            props.onTutorialSelection({
              path: itemId,
              title: ''
            });
          } }
          items={
            props.tutorialList.list.map(({ path, title }) => ({
              title: title,
              itemId: path
            }))
          } />
      </div>
    </>
  );
}

SideBar.propTypes = {
  tutorialList: PropTypes.object,
  onTutorialSelection: PropTypes.func
};

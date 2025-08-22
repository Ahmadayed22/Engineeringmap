'use client';
import CommentForm from '@components/Feature/comment/CommentForm';
import CommentSection from '@components/Feature/comment/CommentSection';
import MaterialSection from '@components/Feature/Material/MaterialSection';

// import type { Node } from '@xyflow/react';
import {
  Button,
  ButtonGroup,
  Drawer,
  DrawerHeader,
  DrawerItems,
  // Label,
} from 'flowbite-react';
import React, { useState } from 'react';

import MarkModal from '../Modal/MarkModal';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import useTreeFlow from '@hooks/CustomHook/useTreeFlow';

function DrawerComp() {
  const [openMaterial, setOpenMaterial] = useState<boolean>(true);
  const [openMark, setOpenMark] = useState<boolean>(false);
  const { accessToken } = useAuth();
  const { courseId, title, drawerOpen } = useTreeFlowContext();
  const { setDrawerOpen } = useTreeFlow();
  return (
    <div className="relative z-100 ">
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="right"
        className="w-full sm:max-w-sm md:max-w-xl lg:max-w-2xl !bg-[#171717] "
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <DrawerHeader title={typeof title === 'string' ? title : undefined} />

          <div className="text-center mb-4">
            <ButtonGroup>
              <Button
                className="cursor-pointer"
                color="alternative"
                onClick={() => setOpenMaterial(true)}
              >
                CommentSection
              </Button>
              <Button
                className="cursor-pointer"
                color="alternative"
                onClick={() => setOpenMaterial(false)}
              >
                Material
              </Button>
              {accessToken && (
                <>
                  <Button
                    className="cursor-pointer"
                    color="alternative"
                    onClick={() => setOpenMark(true)}
                  >
                    AddMark
                  </Button>
                </>
              )}
            </ButtonGroup>
          </div>
          {openMaterial ? (
            <>
              <DrawerItems className="flex-1 overflow-y-auto p-4">
                <CommentSection />
              </DrawerItems>

              {/* Sticky Bottom Form */}
              <CommentForm courseId={courseId} />
            </>
          ) : (
            <>
              <DrawerItems className="flex-1 overflow-y-auto p-4">
                {' '}
                <MaterialSection />
              </DrawerItems>
            </>
          )}
        </div>

        <>
          <MarkModal setOpenModal={setOpenMark} openModal={openMark} />
        </>
      </Drawer>
    </div>
  );
}

export default React.memo(DrawerComp);

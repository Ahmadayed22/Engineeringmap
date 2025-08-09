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
import { useState } from 'react';

type DrawerCompProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  nodeName: string | null | undefined;
  courseId: number | unknown | null;
};

export function DrawerComp({
  isOpen,
  onClose,
  title,
  nodeName,
  courseId,
}: DrawerCompProps) {
  const [openMaterial, setOpenMaterial] = useState<boolean>(true);
  return (
    <div className="relative ">
      <Drawer
        open={isOpen}
        onClose={onClose}
        position="right"
        className="w-full sm:max-w-sm md:max-w-xl lg:max-w-2xl "
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <DrawerHeader
            title={title}
            // titleIcon={HiEnvelope}
            // className="text-center"
          />

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
            </ButtonGroup>
          </div>
          {openMaterial ? (
            <>
              <DrawerItems className="flex-1 overflow-y-auto p-4">
                <CommentSection nodeName={nodeName} courseId={courseId} />
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
      </Drawer>
    </div>
  );
}

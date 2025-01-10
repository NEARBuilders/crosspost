const ModalWindowControls = ({ onClose }) => (
  <div className="border-b-2 border-gray-800">
    <div className="flex items-center justify-end">
      <div
        className="mx-4 my-3 h-4 w-4 cursor-pointer rounded-full bg-black transition-opacity hover:opacity-80"
        onClick={onClose}
      />
    </div>
  </div>
);

export { ModalWindowControls };

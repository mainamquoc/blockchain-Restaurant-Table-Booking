// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title Single-restaurant booking by one-hour slot ID
contract RestaurantBooking {
    address public immutable owner;

    struct Table {
        bool exists;
        uint256 capacity;
    }

    mapping(uint256 => Table) public tables;
    uint256[] private tableIds;
    mapping(uint256 => mapping(uint256 => address)) public bookings;

    error NotOwner();
    error InvalidTableId();
    error InvalidCapacity();
    error TableAlreadyExists(uint256 tableId);
    error TableNotFound(uint256 tableId);
    error InvalidSlotId();
    error SlotAlreadyBooked(uint256 tableId, uint256 slotId);
    error BookingNotFound(uint256 tableId, uint256 slotId);
    error NotBookingOwner();

    event TableRegistered(uint256 indexed tableId, uint256 capacity);
    event TableReserved(uint256 indexed tableId, uint256 indexed slotId, address indexed customer);
    event BookingCancelled(uint256 indexed tableId, uint256 indexed slotId, address indexed customer);

    constructor() {
        owner = msg.sender;
    }

    function registerTable(uint256 tableId, uint256 capacity) external {
        if (msg.sender != owner) revert NotOwner();
        if (tableId == 0) revert InvalidTableId();
        if (capacity == 0) revert InvalidCapacity();
        if (tables[tableId].exists) revert TableAlreadyExists(tableId);

        tables[tableId] = Table(true, capacity);
        tableIds.push(tableId);
        emit TableRegistered(tableId, capacity);
    }

    /// @param slotId Positive hour index: slot start Unix seconds / 3600.
    function reserve(uint256 tableId, uint256 slotId) external {
        if (!tables[tableId].exists) revert TableNotFound(tableId);
        if (slotId == 0) revert InvalidSlotId();
        if (bookings[tableId][slotId] != address(0)) revert SlotAlreadyBooked(tableId, slotId);

        bookings[tableId][slotId] = msg.sender;
        emit TableReserved(tableId, slotId, msg.sender);
    }

    function cancel(uint256 tableId, uint256 slotId) external {
        if (!tables[tableId].exists) revert TableNotFound(tableId);
        if (slotId == 0) revert InvalidSlotId();
        address customer = bookings[tableId][slotId];
        if (customer == address(0)) revert BookingNotFound(tableId, slotId);
        if (customer != msg.sender) revert NotBookingOwner();

        delete bookings[tableId][slotId];
        emit BookingCancelled(tableId, slotId, customer);
    }

    function getTableIds() external view returns (uint256[] memory) {
        return tableIds;
    }
}

-- Blockchain is an audit integrity backend, not an enforcement engine. Remove from engine_configuration.
DELETE FROM engine_configuration WHERE engine_type = 'BLOCKCHAIN';

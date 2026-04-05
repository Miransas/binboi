# Retired Go Models

The active Go runtime no longer depends on a shared `internal/models` package.

Runtime structs now live closer to the active subsystems that own them, primarily inside `internal/controlplane`.

This directory remains only as a documentation marker for historical references.

_Documentation maintained by Sardor Azimov._

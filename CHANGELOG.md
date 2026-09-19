# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-19

### Added

- `IsOIB()` — a `class-validator` property decorator validating the Croatian OIB
  (_osobni identifikacijski broj_), usable in NestJS DTOs through `ValidationPipe`.
- `isValidOib(value)` — the standalone check, for use outside DTOs.
- 11-digit format check plus ISO 7064 MOD 11,10 check-digit verification.

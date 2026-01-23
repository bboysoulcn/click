"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2026-01-22

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create counters table
    op.create_table(
        'counters',
        sa.Column('origin_domain', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=1024), nullable=False),
        sa.Column('counter', sa.BigInteger(), nullable=False, server_default='1'),
        sa.Column('created_ts', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_ts', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("length(origin_domain) <= 255", name='origin_domain_length_check'),
        sa.CheckConstraint("length(slug) <= 1024", name='slug_length_check'),
        sa.CheckConstraint("slug ~ '^[[:alnum:]/_.%\\-]*$'", name='slug_character_check'),
        sa.PrimaryKeyConstraint('origin_domain', 'slug')
    )
    op.create_index('idx_counters_domain_slug', 'counters', ['origin_domain', 'slug'])
    
    # Create rate_limits table
    op.create_table(
        'rate_limits',
        sa.Column('identifier_hash', sa.BigInteger(), nullable=False),
        sa.Column('request_count', sa.BigInteger(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('identifier_hash')
    )
    op.create_index('idx_rate_limits_created', 'rate_limits', ['created_at'])


def downgrade() -> None:
    op.drop_index('idx_rate_limits_created', table_name='rate_limits')
    op.drop_table('rate_limits')
    op.drop_index('idx_counters_domain_slug', table_name='counters')
    op.drop_table('counters')

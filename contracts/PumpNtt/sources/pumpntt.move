/// Module: pumpntt
module pumpntt::pumpntt {
    use sui::transfer::{Self};
    use std::string::{String};
    use sui::object::{Self, UID};
    use sui::dynamic_field as df;
    use sui::tx_context::{Self, TxContext};

    const MODE_LOCKING: u8 = 0;
    const MODE_BURNING: u8 = 1;

    struct Container has key, store {
        id: UID
    }

    struct Ntt has key, store {
        id: UID,
        name: String,
        symbol: String,
        mode: u8,
    }

    struct ChainKey has store, copy, drop {
        chain_id: u16
    }

    struct TokenKey has store, copy, drop {
        chain_id: u16
    }

    struct ManagerKey has store, copy, drop {
        chain_id: u16
    }

    struct Info has copy, store {
        info: vector<u8>
    }

    public fun create_new_ntt(
        name: String,
        symbol: String,
        mode: u8,
        ctx: &mut TxContext
    ) {
        let uid = object::new(ctx);
        let ntt = Ntt {
            id: uid,
            name,
            symbol,
            mode,
        };

        transfer::public_transfer(ntt, tx_context::sender(ctx));
    }

    public fun delete_ntt(ntt: Ntt) {
        let Ntt { id, name : _ , symbol: _ , mode: _} = ntt;
        object::delete(id);
    }

    public fun add_ntt_chain(ntt: &mut Ntt, chain_id: u16, info: vector<u8>) {
        if (!df::exists_(&ntt.id, ChainKey { chain_id })) {
            df::add(&mut ntt.id, ChainKey { chain_id }, Info { info });
        } else {
            let info_mut = df::borrow_mut<ChainKey, Info>(&mut ntt.id, ChainKey { chain_id });
            info_mut.info = info;
        }
    }

    public fun add_ntt_token_contract(ntt: &mut Ntt, chain_id: u16, info: vector<u8>) {
        if (!df::exists_(&ntt.id, TokenKey { chain_id })) {
            df::add(&mut ntt.id, TokenKey { chain_id }, Info { info });
        } else {
            let info_mut = df::borrow_mut<TokenKey, Info>(&mut ntt.id, TokenKey { chain_id });
            info_mut.info = info;
        }
    }

    public fun add_ntt_manager_contract(ntt: &mut Ntt, chain_id: u16, info: vector<u8>) {
        if (!df::exists_(&ntt.id, ManagerKey { chain_id })) {
            df::add(&mut ntt.id, ManagerKey { chain_id }, Info { info });
        } else {
            let info_mut = df::borrow_mut<ManagerKey, Info>(&mut ntt.id, ManagerKey { chain_id });
            info_mut.info = info;
        }
    }
}
